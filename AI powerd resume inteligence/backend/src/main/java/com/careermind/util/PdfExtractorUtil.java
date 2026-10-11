package com.careermind.util;

import com.careermind.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Component
@Slf4j
public class PdfExtractorUtil {

    public String extractTextFromPdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new BadRequestException("Invalid file format. Only PDF files are supported.");
        }

        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {

            if (document.isEncrypted()) {
                throw new BadRequestException("Encrypted or password-protected PDF files cannot be processed.");
            }

            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);

            if (text == null || text.trim().isEmpty()) {
                throw new BadRequestException("Could not extract any readable text from the PDF. It may be scanned or image-only.");
            }

            // Clean multiple consecutive blank lines and trim
            return text.replaceAll("(?m)^[ \t]*\r?\n", "").trim();

        } catch (IOException e) {
            log.error("Failed to parse PDF: {}", e.getMessage());
            throw new BadRequestException("Failed to parse PDF document: " + e.getMessage());
        }
    }
}
