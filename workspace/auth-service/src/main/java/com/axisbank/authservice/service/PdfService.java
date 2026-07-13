package com.axisbank.authservice.service;

import java.io.ByteArrayOutputStream;

import org.springframework.stereotype.Service;

import com.axisbank.authservice.entity.FixedDeposit;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.Image;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class PdfService {

    public byte[] generateFdReceipt(FixedDeposit fd) {

        try {
            Document document = new Document();
            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font logoFont = new Font(
                    Font.FontFamily.HELVETICA,
                    26,
                    Font.BOLD,
                    new BaseColor(151, 20, 77));

            Paragraph logo = new Paragraph(
                    "AXIS BANK LIMITED",
                    logoFont);

            logo.setAlignment(Element.ALIGN_LEFT);

            document.add(logo);
            document.add(new Paragraph(" "));

            document.add(new Paragraph(" "));

            Font titleFont = new Font(
                    Font.FontFamily.HELVETICA,
                    22,
                    Font.BOLD,
                    new BaseColor(151, 20, 77));

            Paragraph title = new Paragraph(
                    "FIXED DEPOSIT RECEIPT",
                    titleFont);

            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));

            Paragraph message = new Paragraph(
                    "Thank you for banking with Axis Bank.\n"
                            + "We value your trust and are committed to serving you better.");

            message.setAlignment(Element.ALIGN_CENTER);
            document.add(message);

            document.add(new Paragraph(" "));
            document.add(new Paragraph(
                    "------------------------------------------------------------"));

            document.add(new Paragraph(
                    "FD Account Number : "
                            + fd.getFdAccountNumber()));

            document.add(new Paragraph(
                    "Customer ID : "
                            + fd.getCustomerId()));

            document.add(new Paragraph(
                    "Linked Savings Account : "
                            + fd.getLinkedSavingsAccount()));

            document.add(new Paragraph(
                    "Principal Amount : Rs. "
                            + fd.getPrincipalAmount()));

            document.add(new Paragraph(
                    "Interest Rate : "
                            + fd.getInterestRate()
                            + "% p.a."));

            document.add(new Paragraph(
                    "Tenure : "
                            + fd.getTenureDays()
                            + " Days"));

            document.add(new Paragraph(
                    "Opening Date : "
                            + fd.getOpeningDate()));

            document.add(new Paragraph(
                    "Maturity Date : "
                            + fd.getMaturityDate()));

            document.add(new Paragraph(
                    "Maturity Amount : Rs. "
                            + fd.getMaturityAmount()));

            document.add(new Paragraph(
                    "Status : "
                            + fd.getStatus()));

            if (fd.getClosureDate() != null) {
                document.add(new Paragraph(
                        "Closure Date : "
                                + fd.getClosureDate()));

                document.add(new Paragraph(
                        "Closure Amount : Rs. "
                                + fd.getClosureAmount()));

                document.add(new Paragraph(
                        "Closure Type : "
                                + fd.getClosureType()));

                document.add(new Paragraph(
                        "Penalty Rate : "
                                + fd.getPenaltyRate()
                                + "%"));
            }

            document.add(new Paragraph(
                    "------------------------------------------------------------"));

            document.add(new Paragraph(" "));

            Font bankFont = new Font(
                    Font.FontFamily.HELVETICA,
                    14,
                    Font.BOLD,
                    new BaseColor(151, 20, 77));

            Paragraph bankName = new Paragraph(
                    "AXIS BANK LIMITED",
                    bankFont);

            bankName.setAlignment(Element.ALIGN_CENTER);
            document.add(bankName);

            Paragraph footer = new Paragraph(
                    "This is a system generated receipt.");

            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.add(new Paragraph(" "));

            Paragraph contact = new Paragraph(
                    "1860 419 5555 | 1860 500 5555 | www.axisbank.com");

            contact.setAlignment(Element.ALIGN_CENTER);
            document.add(contact);

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Unable to generate PDF receipt");
        }
    }
}