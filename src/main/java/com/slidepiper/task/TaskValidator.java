package com.slidepiper.task;

import com.slidepiper.model.entity.Customer;
import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.DocumentRepository;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;

import java.util.Objects;

@Component
@PreAuthorize("hasRole('ROLE_USER')")
public class TaskValidator implements Validator {
    private final CustomerRepository customerRepository;
    private final DocumentRepository documentRepository;
    private final UserService userService;
    private final ViewerRepository viewerRepository;

    @Autowired
    TaskValidator(CustomerRepository customerRepository,
                  DocumentRepository documentRepository,
                  UserService userService,
                  ViewerRepository viewerRepository) {
        this.customerRepository = customerRepository;
        this.documentRepository = documentRepository;
        this.userService = userService;
        this.viewerRepository = viewerRepository;
    }

    @Override
    public boolean supports(Class<?> clazz) {
        return Task.class.equals(clazz);
    }

    @Override
    public void validate(Object o, Errors errors) {
        Task task = (Task) o;

        // Customer.
        Customer customer = customerRepository.findById(task.getCustomerId());
        if (Objects.isNull(customer)) {
            errors.reject(null, "Customer not found");
        } else {
            String username = viewerRepository.findByUserId(userService.getUserId()).getEmail();
            if (!customer.getUsername().equals(username)) {
                errors.reject(null, "Customer not found");
            }
        }

        // Document.
        if (task.getType() == TaskType.DOCUMENT) {
            Document document = documentRepository.findById(((DocumentTask) task).getDocumentId());
            if (Objects.isNull(document)) {
                errors.reject(null, "Document not found");
            } else {
                String username = viewerRepository.findByUserId(userService.getUserId()).getEmail();
                if (!document.getViewer().getEmail().equals(username)) {
                    errors.reject(null, "Document not found");
                }
            }
        }
    }
}