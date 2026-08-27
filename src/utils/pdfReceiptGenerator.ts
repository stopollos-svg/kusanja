import { jsPDF } from 'jspdf';
import { PaymentTransaction, Campaign } from '../types';
import { formatUGX, formatSignedUGX, calculateDonationMinusTarget } from './formatters';

interface GenerateReceiptPDFOptions {
  transaction: PaymentTransaction;
  campaignTitle?: string;
  campaignCategory?: string;
  organizerName?: string;
  beneficiaryName?: string;
  beneficiaryPhone?: string;
  targetAmount?: number;
  raisedAmount?: number;
}

/**
 * Generates and downloads a clean, professional, official PDF receipt for donors
 * after a successful transaction on Kusanya.org.
 */
export function generateDonationReceiptPDF({
  transaction,
  campaignTitle = 'Uganda Community Cause',
  campaignCategory,
  organizerName,
  beneficiaryName,
  beneficiaryPhone,
  targetAmount,
  raisedAmount,
}: GenerateReceiptPDFOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryEmerald = [5, 150, 105]; // #059669
  const darkSlate = [15, 23, 42]; // #0F172A
  const mutedGray = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGray = [226, 232, 240]; // #E2E8F0

  // 1. Top Decorative Bar
  doc.setFillColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  doc.rect(0, 0, pageWidth, 7, 'F');

  let currentY = 18;

  // 2. Header Section
  // Organization Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('KUSANYA.ORG', margin, currentY);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('Uganda Crowdfunding, Church & SACCO Mobilization Platform', margin, currentY + 5);

  // Receipt Badge on top right
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.roundedRect(pageWidth - margin - 48, currentY - 5, 48, 14, 2, 2, 'F');
  doc.setDrawColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - margin - 48, currentY - 5, 48, 14, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  doc.text('OFFICIAL RECEIPT', pageWidth - margin - 24, currentY + 1, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('VERIFIED & CREDITED', pageWidth - margin - 24, currentY + 5.5, { align: 'center' });

  currentY += 16;

  // Divider line
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.4);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // 3. Receipt Metadata Grid (2 Columns: Receipt Details & Donor Info)
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'D');

  const col1X = margin + 6;
  const col2X = margin + (contentWidth / 2) + 4;
  let metaY = currentY + 7;

  // Col 1: Transaction & Date
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('RECEIPT NO:', col1X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(transaction.receiptNumber || `RCP-${transaction.reference}`, col1X + 24, metaY);

  metaY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('TRANSACTION REF:', col1X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(transaction.transactionRef || transaction.reference, col1X + 32, metaY);

  metaY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('NETWORK TX ID:', col1X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(transaction.networkTransactionId || transaction.networkRef || 'N/A', col1X + 28, metaY);

  metaY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('DATE & TIME:', col1X, metaY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  const dateStr = transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('en-GB') : new Date().toLocaleString('en-GB');
  doc.text(dateStr, col1X + 24, metaY);

  // Col 2: Donor & Channel Info
  metaY = currentY + 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('DONOR NAME:', col2X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  const displayDonor = transaction.isAnonymous ? 'Anonymous Donor (Private)' : (transaction.donorName || 'Kind Well-Wisher');
  doc.text(displayDonor, col2X + 24, metaY);

  metaY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('PAYMENT CHANNEL:', col2X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  let providerName = 'MTN Mobile Money (*165#)';
  if (transaction.provider === 'airtel') providerName = 'Airtel Money (*185#)';
  else if (transaction.provider === 'visa' || transaction.provider === 'card') providerName = 'Visa / Mastercard (3D Secure)';
  else if (transaction.provider === 'paypal') providerName = 'PayPal Global Giving';
  doc.text(providerName, col2X + 32, metaY);

  metaY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('PAYMENT STATUS:', col2X, metaY);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  doc.text('COMPLETED & SETTLED', col2X + 30, metaY);

  if (transaction.donorPhone || transaction.phoneNumber) {
    metaY += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text('DONOR PHONE:', col2X, metaY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(transaction.donorPhone || transaction.phoneNumber || '', col2X + 26, metaY);
  }

  currentY += 42;

  // 4. Beneficiary Cause Details Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('BENEFICIARY CAUSE & TARGET DETAILS', margin, currentY);
  currentY += 4;

  const effectiveTarget = targetAmount || transaction.campaignTarget;
  const effectiveRaised = raisedAmount || transaction.campaignRaised;
  const hasTargetStats = effectiveTarget && effectiveTarget > 0;

  const boxHeight = hasTargetStats ? 30 : 24;

  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  const splitTitle = doc.splitTextToSize(campaignTitle, contentWidth - 12);
  doc.text(splitTitle[0] || campaignTitle, margin + 6, currentY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const catText = campaignCategory ? `Category: ${campaignCategory.toUpperCase()}  •  ` : '';
  const benText = beneficiaryName ? `Beneficiary: ${beneficiaryName}${beneficiaryPhone ? ` (${beneficiaryPhone})` : ''}  •  ` : '';
  const orgText = organizerName ? `Organizer: ${organizerName}  •  ` : '';
  doc.text(`${catText}${benText}${orgText}Platform: Kusanya.org`, margin + 6, currentY + 12.5);

  if (hasTargetStats) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    const { amountDonatedMinusTarget } = calculateDonationMinusTarget(effectiveRaised || 0, effectiveTarget);
    doc.text(`Fundraiser Target: ${formatUGX(effectiveTarget)}   |   Total Donated: ${formatUGX(effectiveRaised || 0)}   |   Donated − Target: ${formatSignedUGX(amountDonatedMinusTarget)}`, margin + 6, currentY + 20);
  }

  currentY += boxHeight + 8;

  // 5. Itemized Financial Breakdown Table (Zero Deductions Model)
  const grossAmount = transaction.amount;
  const approxUSD = (grossAmount / 3750).toFixed(2);
  const targetVal = effectiveTarget || 0;
  const singleDonationMinusTarget = grossAmount - targetVal;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('FINANCIAL BREAKDOWN & TARGET CALCULATIONS', margin, currentY);
  currentY += 4;

  // Table Header
  const tableHeaderY = currentY;
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(margin, tableHeaderY, contentWidth, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Description / Item', margin + 6, tableHeaderY + 5.5);
  doc.text('Rate / Calculation', margin + contentWidth - 65, tableHeaderY + 5.5);
  doc.text('Amount (UGX)', margin + contentWidth - 6, tableHeaderY + 5.5, { align: 'right' });

  currentY += 8;

  // Table Row 1: Gross Donation
  const row1Y = currentY;
  doc.setFillColor(255, 255, 255);
  doc.rect(margin, row1Y, contentWidth, 9, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, row1Y + 9, margin + contentWidth, row1Y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Donation Contribution Made', margin + 6, row1Y + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`100% (~$${approxUSD} USD)`, margin + contentWidth - 65, row1Y + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(formatUGX(grossAmount), margin + contentWidth - 6, row1Y + 6, { align: 'right' });

  currentY += 9;

  // Table Row 2: Platform Deductions (0%)
  const row2Y = currentY;
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.rect(margin, row2Y, contentWidth, 10, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, row2Y + 10, margin + contentWidth, row2Y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('Platform & Intermediary Deductions', margin + 6, row2Y + 6);
  doc.setFontSize(8.5);
  doc.text('0.0% (Zero Fee)', margin + contentWidth - 65, row2Y + 6);
  doc.text('UGX 0', margin + contentWidth - 6, row2Y + 6, { align: 'right' });

  currentY += 10;

  // Table Row 3: 100% Net Direct to Cause
  const row3Y = currentY;
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.rect(margin, row3Y, contentWidth, 11, 'F');
  doc.setDrawColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, row3Y + 11, margin + contentWidth, row3Y + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
  doc.text('Net Credited Directly to Beneficiary Cause', margin + 6, row3Y + 7);
  doc.setFont('helvetica', 'bold');
  doc.text('100.0%', margin + contentWidth - 65, row3Y + 7);
  doc.setFontSize(10.5);
  doc.text(formatUGX(grossAmount), margin + contentWidth - 6, row3Y + 7.5, { align: 'right' });

  currentY += 13;

  // Table Row 4: Calculation of Amount Donated Minus Total Target Value
  if (targetVal > 0) {
    const row4Y = currentY;
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(margin, row4Y, contentWidth, 10, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(margin, row4Y + 10, margin + contentWidth, row4Y + 10);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('Database Calculation: Donation Amount − Target Goal', margin + 6, row4Y + 6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Target: ${formatUGX(targetVal)}`, margin + contentWidth - 65, row4Y + 6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryEmerald[0], primaryEmerald[1], primaryEmerald[2]);
    doc.text(formatSignedUGX(singleDonationMinusTarget), margin + contentWidth - 6, row4Y + 6.5, { align: 'right' });

    currentY += 12;
  }

  currentY += 6;

  // 6. Optional Donor Encouragement Note
  if (transaction.message) {
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'F');
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.roundedRect(margin, currentY, contentWidth, 14, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
    doc.text('DONOR WORDS OF ENCOURAGEMENT:', margin + 6, currentY + 4.5);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    const splitMsg = doc.splitTextToSize(`"${transaction.message}"`, contentWidth - 12);
    doc.text(splitMsg[0] || transaction.message, margin + 6, currentY + 9.5);

    currentY += 18;
  }

  // 7. Security & Bank of Uganda Compliance Notice Box
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('BANK OF UGANDA NPS & SECURITY COMPLIANCE GUARANTEE', margin + 6, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  const complianceNotice = 'This transaction was processed in accordance with the National Payment Systems (NPS) Act guidelines. Funds are held in a ring-fenced partner escrow account until disbursement to the verified beneficiary hospital, SACCO, church, or community bank account.';
  const splitNotice = doc.splitTextToSize(complianceNotice, contentWidth - 12);
  doc.text(splitNotice, margin + 6, currentY + 10);

  currentY += 28;

  // 8. Official Seal / Footer
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('Kusanya Technology Ltd • Kampala, Uganda', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('support@kusanya.org • www.kusanya.org', pageWidth - margin, currentY, { align: 'right' });

  // Save / Trigger Download
  const filename = `Kusanya-Receipt-${transaction.transactionRef || transaction.reference || 'donation'}.pdf`;
  doc.save(filename);
}
