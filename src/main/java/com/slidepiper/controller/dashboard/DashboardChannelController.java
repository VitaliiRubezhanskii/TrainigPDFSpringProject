package com.slidepiper.controller.dashboard;

import com.slidepiper.repository.DocumentRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import slidepiper.db.DbLayer;

import java.security.Principal;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardChannelController {
    private final DocumentRepository documentRepository;

    @Autowired
    public DashboardChannelController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /** @deprecated */
    @PostMapping("/api/v1/channels")
    public String createChannel(Principal principal, @RequestBody String body) {
        JSONObject input = new JSONObject(body);
        JSONObject data = input.getJSONObject("data");

        JSONArray customersFilelinks = new JSONArray();
        for (int i = 0; i < data.getJSONArray("data").length(); i++) {
            JSONObject group = data.getJSONArray("data").getJSONObject(i);
            String customerEmail = group.getString("customerEmail");
            JSONArray fileHashes = group.getJSONArray("fileHashes");

            JSONObject customer = new JSONObject();
            JSONArray files = new JSONArray();

            for (int j = 0; j < fileHashes.length(); j++) {
                JSONObject file = new JSONObject();
                file.put("fileHash", fileHashes.getString(j));

                if (documentRepository.findByFriendlyId(fileHashes.getString(j)).getViewer().getEmail().equals(principal.getName())) {

                    file.put("fileLink",
                            DbLayer.setFileLinkHash(
                                    customerEmail,
                                    fileHashes.getString(j),
                                    principal.getName())
                    );
                    files.put(file);

                }
            }
            customer.put("customerEmail", group.getString("customerEmail"));
            customer.put("files", files);
            customersFilelinks.put(customer);
        }

        return customersFilelinks.toString();
    }
}