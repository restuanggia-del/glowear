-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'DIPROSES', 'DIKIRIM', 'SELESAI', 'DIBATALKAN');

-- CreateEnum
CREATE TYPE "DesignStatus" AS ENUM ('MENUNGGU', 'DISETUJUI', 'DITOLAK');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('BELUM_BAYAR', 'DP', 'LUNAS');

-- CreateEnum
CREATE TYPE "JenisSablon" AS ENUM ('PLASTISOL', 'RUBBER', 'DISCHARGE', 'DTF', 'DTG');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalHarga" INTEGER NOT NULL,
    "dpAmount" INTEGER NOT NULL DEFAULT 0,
    "sisaPembayaran" INTEGER NOT NULL DEFAULT 0,
    "statusPembayaran" "PaymentStatus" NOT NULL DEFAULT 'BELUM_BAYAR',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "alamatPengiriman" TEXT NOT NULL,
    "catatanCustom" TEXT,
    "waktuDibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "waktuDiupdate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" INTEGER NOT NULL,
    "jenisSablon" "JenisSablon",
    "gambarDesain" TEXT,
    "deskripsiDesain" TEXT,
    "statusDesain" "DesignStatus" NOT NULL DEFAULT 'MENUNGGU',
    "catatanAdmin" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
