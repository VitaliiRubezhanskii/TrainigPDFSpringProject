package com.slidepiper.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import slidepiper.constants.Constants;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Blob;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
public class MigrateDocumentsToAmazonS3Service {
    private final DocumentService documentService;

    @Autowired
    public MigrateDocumentsToAmazonS3Service(DocumentService documentService) {
        this.documentService = documentService;
    }

    public void migrate(HttpServletResponse response) throws ServletException, IOException {
        List<String> documentHashList = new ArrayList<String>();
        List<String> migratedDocumentHashList = new ArrayList<String>();

        Constants.updateConstants();
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        String sql = "SELECT id AS documentHash FROM slides WHERE file IS NOT NULL ORDER BY timestamp";
        Connection conn = null;

        try {
            conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
            PreparedStatement ps = conn.prepareStatement(sql);
            ResultSet rs = ps.executeQuery();

            while(rs.next()) {
                documentHashList.add(rs.getString("documentHash"));
            }

            System.out.println("Starting to process: " + documentHashList.size() + " documents.");
            int counter = 0;
            for (String documentHash: documentHashList) {
                System.out.println("Starting to process documentHash #" + (++counter) + "/" + documentHashList.size() + ": " + documentHash);
                boolean isMigrated = migrateDocumentToS3(documentHash);

                if (isMigrated) {
                    migratedDocumentHashList.add(documentHash);
                }
            }
            System.out.println("Finished processing: " + migratedDocumentHashList.size() + "/" + documentHashList.size() + " documents.");

            conn.close();
        } catch (SQLException e) {
            System.out.println("SQLException: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (null != conn) {
                try {
                    conn.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
        }

        response.setContentType("application/json; charset=UTF-8");
        PrintWriter output = response.getWriter();
        output.print(migratedDocumentHashList);
        output.close();
    }

    private boolean migrateDocumentToS3(String documentHash) {
        boolean isMigrated = false;

        Constants.updateConstants();
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }

        String sql = "SELECT file, name, id, sales_man_email FROM slides WHERE id = ?";
        Connection conn = null;

        try {
            conn = DriverManager.getConnection(Constants.dbURL, Constants.dbUser, Constants.dbPass);
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, documentHash);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                String friendlyId = rs.getString("id");
                String email = rs.getString("sales_man_email");
                String fileName = rs.getString("name");

                Blob blob = rs.getBlob("file");
                byte[] blobBytes = blob.getBytes(1, (int) blob.length());
                MultipartFile multipartFile = new MockMultipartFile(fileName, fileName, "application/pdf", blobBytes);

                String versionId = documentService.migrate(multipartFile, friendlyId, email);

                if (versionId != null) {
                    isMigrated = true;
                    System.out.println("Finished processing documentHash: " + documentHash + ", versionId: " + versionId);
                }
            }

            conn.close();
        } catch (SQLException | IOException e) {
            System.out.println("Exception for documentHash " + documentHash + ": " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (null != conn) {
                try {
                    conn.close();
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
        }

        return isMigrated;
    }
}
