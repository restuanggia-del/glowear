-- CreateTable
CREATE TABLE "pengaturan_toko" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "namaToko" TEXT NOT NULL DEFAULT 'Glowear',
    "whatsappCS" TEXT,
    "namaBank" TEXT,
    "nomorRekening" TEXT,
    "atasNamaBank" TEXT,
    "syaratKetentuan" TEXT,
    "waktuDiubah" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengaturan_toko_pkey" PRIMARY KEY ("id")
);
