import { supabase } from '@/integrations/supabase/client';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export async function ensurePushSubscription(userId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  if (!('Notification' in window) || Notification.permission !== 'granted') return false;

  const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!publicKey) {
    // No VAPID key configured yet
    return false;
  }

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const json = sub.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } };
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh ?? null;
    const auth = json.keys?.auth ?? null;

    // Upsert subscription for this user (table not in generated types yet)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
      },
      { onConflict: 'user_id' }
    );

    return true;
  } catch (_e) {
    return false;
  }
}
