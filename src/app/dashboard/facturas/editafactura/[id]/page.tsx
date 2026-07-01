"use client";

import { use, useState, useEffect } from "react";
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
  date?: string;
};

type Client = {
  _id: string;
  establishmentName: string;
  contactName: string;
  whatsapp?: string;
  address: string;
};

type InvoiceData = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  clientWhatsapp?: string;
  invoiceDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  paidAmount: number;
  balance: number;
  status: string;
  image?: string;
};

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(true);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: "",
      invoiceNumber: "",
      invoiceDate: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [productsRes, clientsRes, invoiceRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/clients"),
          fetch(`/api/invoices/${id}`)
        ]);

        if (!productsRes.ok) throw new Error("Error cargando productos");
        if (!clientsRes.ok) throw new Error("Error cargando clientes");
        if (!invoiceRes.ok) throw new Error("Error cargando factura");

        if (!isMounted) return;

        const productsData = await productsRes.json();
        const clientsData = await clientsRes.json();
        const invoiceData = await invoiceRes.json();

        setProducts(productsData);
        setClients(clientsData);

        setInvoice(invoiceData);
        setValue("customerName", invoiceData.customerName);
        setValue("invoiceNumber", invoiceData.invoiceNumber);
        
        if (invoiceData.invoiceDate) {
          const date = new Date(invoiceData.invoiceDate);
          date.setHours(date.getHours() - 5);
          setValue("invoiceDate", date.toISOString().split('T')[0]);
        }
        
        const whatsapp = invoiceData.clientWhatsapp || "";
        setClientWhatsapp(whatsapp);
        setItems(invoiceData.items || []);
        setPayments(
          (invoiceData.payments || []).map((p: { amount: number; method?: string; date?: string }) => ({
            amount: p.amount.toString(),
            method: p.method || "cash",
            date: p.date,
          }))
        );
        setDiscount((invoiceData.discount || 0).toString());

        if (whatsapp && clientsData.length > 0) {
          const matchedClient = clientsData.find((c: Client) => 
            c._id === whatsapp || c.whatsapp === whatsapp
          );
          if (matchedClient) {
            setSelectedClient(matchedClient._id);
          }
        }

        setIsLoadingInvoice(false);
      } catch (err) {
        console.error("Error loading data:", err);
        if (isMounted) {
          showToast.error(err instanceof Error ? err.message : "Error al cargar los datos");
          setIsLoadingInvoice(false);
        }
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [id]);

  const formatPrice = (amount: number) => {
    const rounded = Math.round(amount);
    return "$" + rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const customerName = watch("customerName");
  const invoiceDate = watch("invoiceDate");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products:", err));

    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        console.log("Clients loaded:", data.length);
        setClients(data);
      })
      .catch((err) => console.error("Error loading clients:", err));

    fetch(`/api/invoices/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Invoice loaded:", data.invoiceNumber, "clientWhatsapp:", data.clientWhatsapp);
        setInvoice(data);
        setValue("customerName", data.customerName);
        setValue("invoiceNumber", data.invoiceNumber);
        setClientWhatsapp(data.clientWhatsapp || "");
        setItems(data.items || []);
        setPayments(
          (data.payments || []).map((p: { amount: number; method?: string; date?: string }) => ({
            amount: p.amount.toString(),
            method: p.method || "cash",
            date: p.date,
          }))
        );
        setDiscount((data.discount || 0).toString());
        setIsLoadingInvoice(false);
      })
      .catch((err) => {
        console.error("Error loading invoice:", err);
        showToast.error("Error al cargar la factura");
        setIsLoadingInvoice(false);
      });
  }, [id, setValue]);

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
    if (!customerName || items.length === 0) return;

    setIsLoading(true);

    try {
      let imageUrl = invoice?.image || "";

      if (imagen) {
        const uploadedImage = await uploadImage(imagen);
        if (uploadedImage && uploadedImage.image_url) {
          imageUrl = uploadedImage.image_url;
        }
      }

      const adjustedInvoiceDate = invoiceDate ? (() => {
        const date = new Date(invoiceDate + "T00:00:00");
        date.setHours(date.getHours() + 5);
        return date.toISOString();
      })() : undefined;

      const response = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          clientWhatsapp,
          invoiceDate: adjustedInvoiceDate,
          items,
          discount: discountAmount,
          payments: payments.map((p) => ({
            amount: Number(p.amount),
            method: p.method,
          })),
          imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la factura");
      }

      showToast.success("Factura actualizada exitosamente");
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

  if (isLoadingInvoice) {
    return (
      <div className="mx-auto w-full p-6 lg:w-1/2 text-center">
        <p>Cargando factura...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full p-6 lg:w-1/2">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Editar Factura</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {invoice?.image && !previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Imagen Actual
              </label>
              <Image
                src={invoice.image}
                alt="Factura"
                width={200}
                height={200}
                className="mt-2 rounded-md object-cover"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="imagen"
              className="block text-sm font-medium text-gray-700"
            >
              Cambiar Imagen
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
                  className="rounded-md object-cover"
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
              readOnly
              className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm sm:text-sm"
            />
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              WhatsApp del Cliente
            </label>
            <input
              type="tel"
              value={clientWhatsapp}
              onChange={(e) => setClientWhatsapp(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
            Pagos / Abonos
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
                Agregar Pago
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
          {isLoading ? "Actualizando..." : "Actualizar Factura"}
        </button>
      </form>
    </div>
  );
}
