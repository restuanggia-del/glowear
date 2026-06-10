-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "namaProduk" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "gambar" TEXT,
    "waktuDibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktuDiupdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);
