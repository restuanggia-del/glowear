-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "tipe" TEXT NOT NULL DEFAULT 'ORDER',
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "orderId" TEXT,
    "waktu_dibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);
