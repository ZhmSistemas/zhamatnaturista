import mongoose from "mongoose";

export type InvoiceItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
};

export type Payment = {
  amount: number;
  date: Date;
  method: string;
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  customerName: string;
  clientWhatsapp: string;
  invoiceDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  payments: Payment[];
  paidAmount: number;
  balance: number;
  status: "pending" | "partial" | "paid";
  createdAt: Date;
  updatedAt: Date;
};

const InvoiceItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false },
);

const PaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    method: { type: String, default: "cash" },
  },
  { _id: false },
);

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    clientWhatsapp: {
      type: String,
      required: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    items: [InvoiceItemSchema],
    subtotal: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    image: { type: String },
    payments: [PaymentSchema],
    paidAmount: { type: Number, required: true, default: 0 },
    balance: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
  },
  { timestamps: true },
);

if (mongoose.models.Invoice) {
  delete mongoose.models.Invoice;
}
const InvoiceModel = mongoose.model("Invoice", InvoiceSchema);

export default InvoiceModel;
