"use client";

import { useState, useEffect } from "react";
import { useInventory } from "~/hooks/useInventory";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency } from "~/utils/fortmatter";

interface Workspace {
  id: string;
  name: string;
  status: "available" | "occupied";
  order?: Order;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  maxQuantity: number;
}

interface ProductItem {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  availableQuantity: number;
  quantity: number;
}

interface Order {
  id: string;
  workspaceId: string;
  items: OrderItem[];
  timestamp: Date;
  status: "active" | "completed" | "canceled";
}

interface OrderFormProps {
  workspace: Workspace;
  onOrderSaved: () => void;
}

export const OrderForm: React.FC<OrderFormProps> = ({ workspace, onOrderSaved }) => {
  const [productItems, setProductItems] = useState<ProductItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<ProductItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(workspace.order?.items || []);
  const { getInventarioActual } = useInventory();
  
  // Cargar datos de productos
  useEffect(() => {
    // Esto se ejecuta cuando cambia el resultado de getInventarioActual
    if (getInventarioActual.data) {
      const availableProducts = getInventarioActual.data.map((item: any) => {
        // Obtener cantidad total usada en órdenes activas
        const reservedQuantity = getReservedQuantity(item.producto.id);
        const availableQuantity = item.inventario.cantidadDisponible - reservedQuantity;
        
        return {
          productId: item.producto.id,
          productName: item.producto.nombre,
          price: item.precio,
          stock: item.inventario.cantidadDisponible,
          availableQuantity: availableQuantity > 0 ? availableQuantity : 0,
          quantity: 0,
        };
      });
      
      setProductItems(availableProducts);
      setFilteredProducts(availableProducts);
    }
  }, [getInventarioActual.data]);

  // Filtrar productos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = productItems.filter(product => 
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(productItems);
    }
  }, [searchTerm, productItems]);
  
  // Cargar orden existente si el workspace ya tiene una
  useEffect(() => {
    if (workspace.order) {
      setOrderItems(workspace.order.items);
      
      // Actualizar las cantidades seleccionadas en los productos
      if (workspace.order.items.length > 0 && productItems.length > 0) {
        const updatedProducts = productItems.map(product => {
          const orderItem = workspace.order?.items.find(item => item.productId === product.productId);
          return orderItem 
            ? { ...product, quantity: orderItem.quantity }
            : product;
        });
        
        setProductItems(updatedProducts);
        setFilteredProducts(updatedProducts);
      }
    }
  }, [workspace, productItems.length]);

  // Función para obtener la cantidad reservada de un producto en otros workspaces
  const getReservedQuantity = (productId: string): number => {
    const savedWorkspaces = localStorage.getItem("restaurant_workspaces");
    if (!savedWorkspaces) return 0;
    
    try {
      const workspaces = JSON.parse(savedWorkspaces);
      let reservedCount = 0;
      
      // Sumar cantidades de este producto en órdenes activas (excluyendo la orden actual)
      workspaces.forEach((ws: any) => {
        if (ws.id !== workspace.id && ws.order && ws.status === "occupied") {
          const productInOrder = ws.order.items.find((item: any) => item.productId === productId);
          if (productInOrder) {
            reservedCount += productInOrder.quantity;
          }
        }
      });
      
      return reservedCount;
    } catch (error) {
      console.error("Error al calcular cantidad reservada:", error);
      return 0;
    }
  };

  // Función para incrementar la cantidad de un producto
  const incrementQuantity = (productId: string) => {
    // Actualizar cantidad en la lista de productos
    const updatedProducts = productItems.map(product => {
      if (product.productId === productId) {
        // Verificar que no exceda la cantidad disponible
        if (product.quantity < product.availableQuantity) {
          return { ...product, quantity: product.quantity + 1 };
        }
      }
      return product;
    });
    
    setProductItems(updatedProducts);
    
    // Actualizar el filtrado también
    if (searchTerm) {
      const updatedFiltered = updatedProducts.filter(product => 
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(updatedFiltered);
    } else {
      setFilteredProducts(updatedProducts);
    }
    
    // Actualizar la orden actual
    const product = productItems.find(p => p.productId === productId);
    if (product && product.quantity < product.availableQuantity) {
      const existingItem = orderItems.find(item => item.productId === productId);
      
      if (existingItem) {
        setOrderItems(orderItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setOrderItems([...orderItems, {
          productId,
          productName: product.productName,
          quantity: 1,
          price: product.price,
          maxQuantity: product.availableQuantity
        }]);
      }
    }
  };

  // Función para decrementar la cantidad de un producto
  const decrementQuantity = (productId: string) => {
    // Actualizar cantidad en la lista de productos
    const updatedProducts = productItems.map(product => {
      if (product.productId === productId && product.quantity > 0) {
        return { ...product, quantity: product.quantity - 1 };
      }
      return product;
    });
    
    setProductItems(updatedProducts);
    
    // Actualizar el filtrado también
    if (searchTerm) {
      const updatedFiltered = updatedProducts.filter(product => 
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(updatedFiltered);
    } else {
      setFilteredProducts(updatedProducts);
    }
    
    // Actualizar la orden actual
    const existingItemIndex = orderItems.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Usamos ! para indicar a TypeScript que sabemos que este valor no será undefined
      // ya que hemos verificado que existingItemIndex >= 0
      const currentItem = orderItems[existingItemIndex]!;

      if (currentItem.quantity > 1) {
        // Si la cantidad es mayor a 1, simplemente decrementar
        const updatedOrderItems: OrderItem[] = orderItems.map(item => {
          if (item.productId === productId) {
            return {
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity - 1,
              price: item.price,
              maxQuantity: item.maxQuantity
            };
          }
          return item;
        });
        setOrderItems(updatedOrderItems);
      } else {
        // Si la cantidad es 1, eliminar el item
        const newOrderItems = [...orderItems];
        newOrderItems.splice(existingItemIndex, 1);
        setOrderItems(newOrderItems);
      }
    }
  };

  // Función para guardar la orden
  const saveOrder = () => {
    if (orderItems.length === 0) {
      alert("No hay productos seleccionados en la orden");
      return;
    }
    
    // Actualizar el workspace con la nueva orden
    const updatedOrder = {
      id: workspace.order?.id || uuidv4(),
      workspaceId: workspace.id,
      items: orderItems,
      timestamp: new Date(),
      status: "active" as const
    };
    
    // Actualizar el workspace en localStorage
    const savedWorkspaces = localStorage.getItem("restaurant_workspaces");
    if (savedWorkspaces) {
      try {
        const workspaces = JSON.parse(savedWorkspaces);
        const updatedWorkspaces = workspaces.map((ws: any) => {
          if (ws.id === workspace.id) {
            return {
              ...ws,
              status: "occupied" as const,
              order: updatedOrder
            };
          }
          return ws;
        });
        
        localStorage.setItem("restaurant_workspaces", JSON.stringify(updatedWorkspaces));
        alert("Orden guardada correctamente");
        onOrderSaved();
      } catch (error) {
        console.error("Error al guardar la orden:", error);
        alert("Error al guardar la orden");
      }
    }
  };

  // Cálculo del total de la orden
  const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (getInventarioActual.isLoading) {
    return <div className="text-center py-8">Cargando productos...</div>;
  }

  if (getInventarioActual.isError) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar el inventario de productos
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Búsqueda de productos */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg p-3"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lista de productos disponibles */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Productos Disponibles</h2>
          
          <div className="max-h-[60vh] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              <div className="space-y-3">
                {filteredProducts.map(product => (
                  <div 
                    key={product.productId}
                    className={`bg-white p-3 rounded-md shadow flex justify-between items-center
                      ${product.availableQuantity === 0 ? 'opacity-50' : ''}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{product.productName}</h3>
                      <p className="text-gray-500 text-sm">
                        Precio: {formatCurrency(product.price)}
                      </p>
                      <p className={`text-sm ${
                        product.availableQuantity < 5 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        Disponible: {product.availableQuantity}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => decrementQuantity(product.productId)}
                        disabled={!orderItems.some(item => item.productId === product.productId)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full
                          ${orderItems.some(item => item.productId === product.productId)
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        -
                      </button>
                      
                      <span className="font-medium w-8 text-center">
                        {product.quantity || 0}
                      </span>
                      
                      <button
                        onClick={() => incrementQuantity(product.productId)}
                        disabled={product.availableQuantity === 0 || 
                          product.quantity >= product.availableQuantity}
                        className={`w-8 h-8 flex items-center justify-center rounded-full 
                          ${product.availableQuantity > 0 &&
                            product.quantity < product.availableQuantity
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No se encontraron productos
              </p>
            )}
          </div>
        </div>
        
        {/* Resumen de la orden */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Resumen de la Orden</h2>
          
          <div className="max-h-[60vh] overflow-y-auto mb-4">
            {orderItems.length > 0 ? (
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.productId} className="bg-white p-3 rounded-md shadow flex justify-between">
                    <div>
                      <h3 className="font-medium">{item.productName}</h3>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No hay productos en la orden
              </p>
            )}
          </div>
          
          {orderItems.length > 0 && (
            <>
              <div className="flex justify-between py-3 border-t border-gray-200 font-semibold text-lg">
                <span>Total:</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
              
              <button
                onClick={saveOrder}
                className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                {workspace.order ? 'Actualizar Orden' : 'Guardar Orden'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};