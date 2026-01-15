-- CreateIndex
CREATE INDEX "Appointment_userId_status_idx" ON "Appointment"("userId", "status");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Appointment_leadId_idx" ON "Appointment"("leadId");

-- CreateIndex
CREATE INDEX "Appointment_scheduledAt_idx" ON "Appointment"("scheduledAt");

-- CreateIndex
CREATE INDEX "Call_userId_createdAt_idx" ON "Call"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Call_createdAt_idx" ON "Call"("createdAt");

-- CreateIndex
CREATE INDEX "Call_leadId_idx" ON "Call"("leadId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_industryId_idx" ON "Lead"("industryId");

-- CreateIndex
CREATE INDEX "Lead_serviceId_idx" ON "Lead"("serviceId");

-- CreateIndex
CREATE INDEX "Lead_importBatchId_idx" ON "Lead"("importBatchId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
