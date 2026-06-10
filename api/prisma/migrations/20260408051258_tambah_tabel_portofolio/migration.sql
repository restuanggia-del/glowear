-- CreateTable
CREATE TABLE "portofolio" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "gambar" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "waktu_dibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portofolio_pkey" PRIMARY KEY ("id")
);
