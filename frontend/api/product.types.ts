type Base64<imageType extends string> =
  `data:image/${imageType};base64, ${string}`;

export type Product = {
  product_id: number;
  product_name: string;
  product_description: string;
  base_price: number;
  current_price: number;
  product_date_added: number;
  product_main_img: string;
};

export type ProductFull = {
  tags: [];
  additional_img: [];
  // TODO: reviews?
} & Product;

export type ShoppingCartEntry = {
  quantity: number;
  delivery: boolean;
  warehouse_id: number | null;
} & Product;

export type WishlistEntry = {
  quantity: number;
} & Product;

export type ProductListingCreation = {
  product_name: string;
  product_description: string;
  base_price: number;
  current_price: number;
  product_tags: string[];
  main_product_img_file: File | null;
  additional_product_img_files: File[];
  warehouse_ids: number[];
  quantities: number[];
};
