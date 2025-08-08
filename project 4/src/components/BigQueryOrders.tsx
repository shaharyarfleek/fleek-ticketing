import React from 'react';
import { useOrders } from '../hooks/useOrders';
import { RefreshCw, AlertCircle, Package, DollarSign } from 'lucide-react';

export const BigQueryOrders: React.FC = () => {
  const { orders, loading, error, refetch } = useOrders();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading orders from BigQuery...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-red-800 font-medium">Error Loading Orders</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={refetch}
          className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">BigQuery Orders</h2>
          <p className="text-gray-600">Live data from your BigQuery database</p>
        </div>
        <button
          onClick={refetch}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600">No orders were found in your BigQuery database.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div key={order.orderLineId} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Order #{order.orderLineId}
                  </h3>
                  <p className="text-sm text-gray-500">Order Line ID</p>
                </div>
                <Package className="w-5 h-5 text-blue-500" />
              </div>
              
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-lg font-semibold text-gray-900">
                  {order.orderValue.toFixed(2)} {order.currency}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium text-gray-900">{order.currency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {orders.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {orders.length} orders from BigQuery
        </div>
      )}
    </div>
  );
};