/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `pengguna` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `pengguna` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PELANGGAN');

-- AlterTable
ALTER TABLE "pengguna" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PELANGGAN',
ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_username_key" ON "pengguna"("username");
