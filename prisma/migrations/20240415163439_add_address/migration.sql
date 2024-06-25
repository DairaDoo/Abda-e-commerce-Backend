-- CreateTable
CREATE TABLE "Role" (
    "role_id" SERIAL NOT NULL,
    "role_type" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role_id" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Color" (
    "color_id" SERIAL NOT NULL,
    "color_name" TEXT NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("color_id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "brand_id" SERIAL NOT NULL,
    "brand_name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("brand_id")
);

-- CreateTable
CREATE TABLE "GeneralProduct" (
    "general_product_id" SERIAL NOT NULL,
    "brand_id" INTEGER NOT NULL,
    "section_id" INTEGER NOT NULL,
    "general_product_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "GeneralProduct_pkey" PRIMARY KEY ("general_product_id")
);

-- CreateTable
CREATE TABLE "WantedProduct" (
    "general_product_id" INTEGER NOT NULL,
    "most_wanted_product_count" INTEGER NOT NULL,

    CONSTRAINT "WantedProduct_pkey" PRIMARY KEY ("general_product_id")
);

-- CreateTable
CREATE TABLE "Section" (
    "section_id" SERIAL NOT NULL,
    "section_name" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("section_id")
);

-- CreateTable
CREATE TABLE "Size" (
    "size_id" SERIAL NOT NULL,
    "size_type" TEXT NOT NULL,

    CONSTRAINT "Size_pkey" PRIMARY KEY ("size_id")
);

-- CreateTable
CREATE TABLE "Size_Amount" (
    "size_amount_id" SERIAL NOT NULL,
    "size_id" INTEGER NOT NULL,
    "size_amount" INTEGER NOT NULL,

    CONSTRAINT "Size_Amount_pkey" PRIMARY KEY ("size_amount_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "color_id" INTEGER NOT NULL,
    "size_amount_id" INTEGER NOT NULL,
    "general_product_id" INTEGER NOT NULL,
    "hover_image_url" TEXT,
    "image_url" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "purchased_products" INTEGER NOT NULL,
    "order_total" DOUBLE PRECISION NOT NULL,
    "address_id" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "Product_Order" (
    "product_order_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_quantity" INTEGER NOT NULL,
    "product_total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_Order_pkey" PRIMARY KEY ("product_order_id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "cart_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cart_total_price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("cart_id")
);

-- CreateTable
CREATE TABLE "Adress" (
    "adress_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "adress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,

    CONSTRAINT "Adress_pkey" PRIMARY KEY ("adress_id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "cart_item_id" SERIAL NOT NULL,
    "cart_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "product_price" DOUBLE PRECISION NOT NULL,
    "product_quantity" INTEGER NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("cart_item_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_id_key" ON "Role"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_id_key" ON "User"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Color_color_id_key" ON "Color"("color_id");

-- CreateIndex
CREATE UNIQUE INDEX "Color_color_name_key" ON "Color"("color_name");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_brand_id_key" ON "Brand"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Section_section_name_key" ON "Section"("section_name");

-- CreateIndex
CREATE UNIQUE INDEX "Size_size_id_key" ON "Size"("size_id");

-- CreateIndex
CREATE UNIQUE INDEX "Size_size_type_key" ON "Size"("size_type");

-- CreateIndex
CREATE UNIQUE INDEX "Size_Amount_size_amount_id_key" ON "Size_Amount"("size_amount_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_product_id_key" ON "Product"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Order_order_id_key" ON "Order"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_Order_product_order_id_key" ON "Product_Order"("product_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_cart_id_key" ON "Cart"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_user_id_key" ON "Cart"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Adress_adress_id_key" ON "Adress"("adress_id");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cart_item_id_key" ON "CartItem"("cart_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cart_id_product_id_key" ON "CartItem"("cart_id", "product_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProduct" ADD CONSTRAINT "GeneralProduct_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("brand_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralProduct" ADD CONSTRAINT "GeneralProduct_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "Section"("section_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WantedProduct" ADD CONSTRAINT "WantedProduct_general_product_id_fkey" FOREIGN KEY ("general_product_id") REFERENCES "GeneralProduct"("general_product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Size_Amount" ADD CONSTRAINT "Size_Amount_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "Size"("size_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "Color"("color_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_general_product_id_fkey" FOREIGN KEY ("general_product_id") REFERENCES "GeneralProduct"("general_product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_size_amount_id_fkey" FOREIGN KEY ("size_amount_id") REFERENCES "Size_Amount"("size_amount_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "Adress"("adress_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product_Order" ADD CONSTRAINT "Product_Order_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adress" ADD CONSTRAINT "Adress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "Cart"("cart_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
