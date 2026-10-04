import { jsPDF } from 'jspdf';

/**
 * Generates and downloads a clean, branded PDF Tax Invoice / Receipt for RideFlow
 */
export function downloadTripReceipt(booking, user) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [236, 72, 153]; // Brand Pink / Accent
    const slateDark = [15, 23, 42];
    const slateMuted = [100, 116, 139];
    const bgLight = [248, 250, 252];

    const invoiceNo = 'INV-' + (booking.id || 'RF-849201').replace('RF-', '') + '-' + new Date().getFullYear();
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Header Banner
    doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.rect(0, 0, 210, 38, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('RideFlow', 15, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('Smart Unified Mobility & Trip Planner • Tamil Nadu Hub', 15, 25);
    doc.text('GSTIN: 33AAACR4921F1ZX • rideflow2026@gmail.com', 15, 30);

    // Invoice Tag (Right)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(236, 72, 153);
    doc.text('TAX INVOICE', 195, 18, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Invoice No: ${invoiceNo}`, 195, 25, { align: 'right' });
    doc.text(`Date: ${invoiceDate}`, 195, 30, { align: 'right' });

    // 2. Customer & Booking Overview (2 Columns)
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.roundedRect(15, 46, 180, 32, 3, 3, 'FD');

    // Left Col: Billed To
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BILLED TO (PASSENGER)', 22, 54);

    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.setFontSize(11);
    doc.text(user?.name || 'Alex Chen', 22, 61);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(user?.phone || '+91 98201 23456', 22, 67);
    doc.text(user?.email || 'alex.chen@rideflow.in', 22, 73);

    // Right Col: Booking Meta
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING REFERENCE', 115, 54);

    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.setFontSize(11);
    doc.text(booking.id || 'RF-849201', 115, 61);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`Mode: ${booking.mode || 'Book a Driver'}`, 115, 67);
    doc.text(`Payment: ${booking.paymentMethodName || 'RideFlow Wallet (Prepaid)'}`, 115, 73);

    // 3. Trip Itinerary Details Box
    doc.roundedRect(15, 84, 180, 28, 3, 3, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('TRIP ITINERARY & VEHICLE', 22, 92);

    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.title || 'Chennai Central ➔ OMR IT Expressway', 22, 99);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`Vehicle / Partner: ${booking.driverOrHost || 'Toyota Innova Crysta (TN-01-AX-7892)'}`, 22, 106);

    // 4. Line Items Table Header
    let yPos = 120;
    doc.setFillColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.rect(15, yPos, 180, 8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM DESCRIPTION', 20, yPos + 5.5);
    doc.text('RATE (INR)', 130, yPos + 5.5);
    doc.text('QTY / UNITS', 155, yPos + 5.5);
    doc.text('AMOUNT', 190, yPos + 5.5, { align: 'right' });

    // Line Items Rows
    const fare = Number(booking.fare || booking.finalPrice || 350);
    const baseFare = Math.round(fare * 0.4);
    const distanceFare = Math.round(fare * 0.45);
    const platformFee = Math.round(fare * 0.1);
    const gstAmount = Math.max(10, Math.round(fare * 0.05));
    const subtotal = baseFare + distanceFare + platformFee;

    const items = [
      { name: `${booking.mode} - Base Transit Fare`, rate: `Rs. ${baseFare}`, qty: '1 Trip', amount: `Rs. ${baseFare}` },
      { name: 'Distance & Duration Operating Charge', rate: `Rs. ${distanceFare}`, qty: 'Per Route', amount: `Rs. ${distanceFare}` },
      { name: 'Platform Safety, GPS & SOS Support Fee', rate: `Rs. ${platformFee}`, qty: '1 Booking', amount: `Rs. ${platformFee}` },
      { name: 'GST @ 5% (CGST 2.5% + SGST 2.5%)', rate: `Rs. ${gstAmount}`, qty: '5% Tax', amount: `Rs. ${gstAmount}` },
    ];

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    items.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos, 180, 7.5, 'F');
      }
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text(item.name, 20, yPos + 5);
      doc.text(item.rate, 130, yPos + 5);
      doc.text(item.qty, 155, yPos + 5);
      doc.text(item.amount, 190, yPos + 5, { align: 'right' });
      yPos += 7.5;
    });

    // 5. Total Calculation Summary Box
    yPos += 4;
    doc.setDrawColor(226, 232, 240);
    doc.line(15, yPos, 195, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('Subtotal:', 140, yPos);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(`Rs. ${subtotal + gstAmount}`, 190, yPos, { align: 'right' });

    if (booking.discount) {
      yPos += 6;
      doc.setTextColor(16, 185, 129);
      doc.text('Reward Points Discount:', 140, yPos);
      doc.text(`-Rs. ${booking.discount}`, 190, yPos, { align: 'right' });
    }

    yPos += 8;
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(130, yPos - 5, 65, 12, 2, 2, 'F');

    doc.setFontSize(11);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('Total Paid:', 135, yPos + 3);
    doc.setFontSize(13);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Rs. ${fare}`, 190, yPos + 3, { align: 'right' });

    // 6. Security Stamp & QR Verification Code Mockup
    yPos += 22;
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, yPos, 180, 24, 3, 3, 'FD');

    // Stamp text
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('✓ DIGITALLY VERIFIED TAX INVOICE', 22, yPos + 8);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('This is a computer-generated tax invoice issued by RideFlow Mobility Network India.', 22, yPos + 14);
    doc.text('Eligible for input tax credit under Indian GST Rules. Thank you for riding green!', 22, yPos + 19);

    // Footer note
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('RideFlow Mobility Technologies • 24x7 Safety Helpline: 1800-419-RIDE • Chennai, Tamil Nadu, India', 105, 285, { align: 'center' });

    // Trigger download
    const fileName = `RideFlow_Receipt_${booking.id || 'RF-849201'}.pdf`;
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('Failed to generate PDF receipt', error);
    // Fallback: trigger print
    window.print();
    return false;
  }
}
