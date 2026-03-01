-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productoId_idx" ON "OrderItem"("productoId");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_productoId_idx" ON "OrderItem"("orderId", "productoId");

-- CreateIndex
CREATE INDEX "Orders_userId_idx" ON "Orders"("userId");

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "Orders"("status");

-- CreateIndex
CREATE INDEX "Orders_userId_status_idx" ON "Orders"("userId", "status");

-- CreateIndex
CREATE INDEX "Orders_createdAt_idx" ON "Orders"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "Orders_status_createdAt_idx" ON "Orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Productos_category_idx" ON "Productos"("category");

-- CreateIndex
CREATE INDEX "Productos_estado_idx" ON "Productos"("estado");

-- CreateIndex
CREATE INDEX "Productos_category_estado_idx" ON "Productos"("category", "estado");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
