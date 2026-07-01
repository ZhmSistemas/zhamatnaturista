import mongoose from "mongoose";

export type Product = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  stock: number;
  image?: string;
  discount?: number;
  codigo?: string;
  categoria?: string;
  marca?: string;
  precioCompra?: number;
  componentes?: string;
  formaConsumo?: string;
};

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    image: { type: String },
    discount: { type: Number, default: 0 },
    codigo: { type: String, unique: true, required: true },
    categoria: { type: String },
    marca: { type: String },
    precioCompra: { type: Number },
    componentes: { type: String },
    formaConsumo: { type: String },
  },
  { timestamps: true },
);

const ProductModel =
  mongoose.models?.Product || mongoose.model("Product", ProductSchema);

export default ProductModel;
