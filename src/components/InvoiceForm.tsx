"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { showToast } from "nextjs-toast-notify";
import { useRouter } from "next/navigation";
import { Plus, Trash2, DollarSign } from "lucide-react";
import Image from "next/image";

type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
};

type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

type Payment = {
  amount: string;
  method: string;
};

type Client = {
  _id: string;
  establishmentName: string;
  contactName: string;
  whatsapp?: string;
  address: string;
};

export default function InvoiceForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const router = useRouter();

  const formatPrice = (amount: number) => {
    const rounded = Math.round(amount);
    return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      customerName: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split('T')[0],
    },
  });

  const customerName = watch("customerName");
  const invoiceNumber = watch("invoiceNumber");
  const invoiceDate = watch("invoiceDate");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products:", err));

    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => setClients(data))
      .catch((err) => console.error("Error loading clients:", err));
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
  const discountAmount = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);
  const paidAmount = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const balance = total - paidAmount;

  const addProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find((p) => p._id === selectedProduct);
    if (!product) return;

    const existingIndex = items.findIndex(
      (item) => item.productId === selectedProduct,
    );
    if (existingIndex >= 0) {
      const updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
      updatedItems[existingIndex].subtotal =
        updatedItems[existingIndex].quantity *
        updatedItems[existingIndex].price;
      setItems(updatedItems);
    } else {
      setItems([
        ...items,
        {
          productId: product._id,
          productName: product.name,
          quantity,
          price: product.price,
          subtotal: product.price * quantity,
        },
      ]);
    }
    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItemPrice = (index: number, newPrice: number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      price: newPrice,
      subtotal: newPrice * updatedItems[index].quantity,
    };
    setItems(updatedItems);
  };

  const addPayment = () => {
    if (!paymentAmount || Number(paymentAmount) <= 0) return;
    setPayments([
      ...payments,
      { amount: paymentAmount, method: paymentMethod },
    ]);
    setPaymentAmount("");
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setImagen(files[0]);
      // Crear URL de vista previa
      const objectUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(objectUrl);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    );
    // Añade el nombre de la carpeta aquí
    formData.append("folder", "imageproduct");
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error("El nombre de la nube de Cloudinary no está definido");
      }

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Cloudinary error: ${errorData.error.message}`);
      }
      const data = await res.json();
      console.log(data.secure_url);

      return {
        public_id: data.public_id,
        image_url: data.secure_url,
      };
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  };

  const onSubmit = async () => {
    if (!customerName || !invoiceNumber || !invoiceDate || items.length === 0) return;

    setIsLoading(true);

    try {
      if (!imagen) {
        throw new Error("No se ha seleccionado ninguna imagen");
      }

      const uploadedImage = await uploadImage(imagen);
      if (!uploadedImage || !uploadedImage.image_url) {
        throw new Error("No se pudo obtener la URL de la imagen subida");
      }

      const adjustedInvoiceDate = (() => {
        const date = new Date(invoiceDate + "T00:00:00");
        date.setHours(date.getHours() + 5);
        return date.toISOString();
      })();

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber,
          customerName,
          clientWhatsapp,
          invoiceDate: adjustedInvoiceDate,
          items,
          discount: discountAmount,
          payments: payments.map((p) => ({
            amount: Number(p.amount),
            method: p.method,
          })),
          imageUrl: uploadedImage.image_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la factura");
      }

      showToast.success("Factura creada exitosamente");
      setItems([]);
      setPayments([]);
      setSelectedProduct("");
      setQuantity(1);
      setPaymentAmount("");

      // Notificar al dashboard padre que debe cambiar la selección
      /* if (window.parent !== window) {
        window.parent.postMessage(
          {
            type: "UPDATE_DASHBOARD_SELECTION",
            option: "muestrafactura",
          },
          "*",
        );
      } */
      router.push("/dashboard/facturas/muestrafactura");
    } catch (error) {
      if (error instanceof Error) {
        showToast.error(error.message);
      } else {
        showToast.error("Ocurrio un error inesperado");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full p-6 lg:w-1/2">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Crear Factura</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 ">
          <div>
            <label
              htmlFor="imagen"
              className="block text-sm font-medium text-gray-700"
            >
              Imagen Factura
            </label>
            <input
              id="imagen"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {previewUrl && (
              <div className="mt-4">
                <Image
                  src={previewUrl}
                  alt="Vista previa"
                  width={200}
                  height={200}
                  className=" rounded-md object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número de Factura
            </label>
            <input
              type="text"
              {...register("invoiceNumber", {
                required: "El número de factura es obligatorio",
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            {errors.invoiceNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.invoiceNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de Factura
            </label>
            <input
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register("invoiceDate", {
                required: "La fecha de factura es obligatoria",
                validate: (value) => {
                  const selectedDate = new Date(value)
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return selectedDate <= today || "La fecha no puede ser posterior al día de hoy"
                }
              })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            />
            {errors.invoiceDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.invoiceDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cliente
            </label>
            <select
              value={selectedClient}
              onChange={(e) => {
                setSelectedClient(e.target.value);
                const client = clients.find((c) => c._id === e.target.value);
                if (client) {
                  setValue("customerName", client.establishmentName);
                  setClientWhatsapp(client.whatsapp || client._id);
                } else {
                  setValue("customerName", "");
                  setClientWhatsapp("");
                }
              }}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((client) => (
                <option key={client._id} value={client._id}>
                  {client.establishmentName} - {client.contactName}
                </option>
              ))}
            </select>
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              WhatsApp del Cliente
            </label>
            <input
              type="tel"
              value={clientWhatsapp}
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm sm:text-sm"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Agregar Productos
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Producto
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Seleccionar producto</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name} - {formatPrice(product.price)}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full sm:w-24">
              <label className="block text-sm font-medium text-gray-700">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addProduct}
                className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                Agregar
              </button>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Productos en Factura
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-700">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2">Cantidad</th>
                    <th className="pb-2">Precio</th>
                    <th className="pb-2">Subtotal</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.productName}</td>
                      <td className="py-2">{item.quantity}</td>
                      <td className="py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.price}
                          onChange={(e) =>
                            updateItemPrice(index, Number(e.target.value))
                          }
                          className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="py-2">{formatPrice(item.subtotal)}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Descuento:
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
                className="w-32 rounded-md border border-gray-300 px-3 py-2 text-right shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-4 text-right">
              <p className="text-lg font-semibold">
                Total: {formatPrice(total)}
              </p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Abonos / Pagos
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">
                Monto
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="block text-sm font-medium text-gray-700">
                Método
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={addPayment}
                className="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 w-full sm:w-auto"
              >
                <DollarSign className="h-4 w-4" />
                Abonar
              </button>
            </div>
          </div>

          {payments.length > 0 && (
            <div className="mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-gray-700">
                    <th className="pb-2">Monto</th>
                    <th className="pb-2">Método</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">
                        {formatPrice(Number(payment.amount))}
                      </td>
                      <td className="py-2">
                        {payment.method === "cash"
                          ? "Efectivo"
                          : payment.method === "card"
                            ? "Tarjeta"
                            : "Transferencia"}
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removePayment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium">
                {formatPrice(subtotal)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Descuento:</span>
                <span className="text-sm font-medium text-red-600">
                  -{formatPrice(discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total:</span>
              <span className="text-lg font-bold">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Abonado:</span>
              <span className="text-sm font-medium text-green-600">
                {formatPrice(paidAmount)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-base font-semibold">Saldo Pendiente:</span>
              <span
                className={`text-base font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatPrice(balance)}
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || items.length === 0}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
        >
          {isLoading ? "Guardando..." : "Guardar Factura"}
        </button>
      </form>
    </div>
  );
}
