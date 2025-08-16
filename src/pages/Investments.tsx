import React from 'react';
import Layout from '@/components/Layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Construction, TrendingUp, Zap, Clock } from 'lucide-react';

const Investments = () => {
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              {/* Icon principale con animazione */}
              <div className="relative">
                <div className="mx-auto w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Construction className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
                </div>
                <div className="absolute -top-2 -right-2">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800">
                    <Zap className="w-3 h-3 mr-1" />
                    Beta
                  </Badge>
                </div>
              </div>

              {/* Titolo principale */}
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  💼 Investimenti
                </h1>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
                  Funzionalità in Sviluppo
                </h2>
              </div>

              {/* Descrizione */}
              <div className="space-y-4 max-w-lg mx-auto">
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  Stiamo lavorando per offrirti un'esperienza di gestione investimenti 
                  completamente rinnovata e più potente.
                </p>
                
                {/* Features in arrivo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Portfolio Tracking</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg backdrop-blur-sm">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analisi AI</span>
                  </div>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex justify-center">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  Disponibile Prossimamente
                </Badge>
              </div>

              {/* Footer note */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nel frattempo, continua a gestire le tue finanze con le altre sezioni dell'app
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Investments;
