-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
