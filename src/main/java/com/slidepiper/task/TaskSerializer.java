package com.slidepiper.task;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.jsontype.TypeSerializer;
import com.slidepiper.model.customer.Customer;
import com.slidepiper.model.entity.Document;
import com.slidepiper.repository.CustomerRepository;
import com.slidepiper.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.Objects;
import java.util.Optional;

@Component
class TaskSerializer extends JsonSerializer<Task> {
    private String url;
    private CustomerRepository customerRepository;
    private DocumentRepository documentRepository;

    TaskSerializer() {}

    @Autowired
    TaskSerializer(@Value("${slidepiper.url}") String url,
                   CustomerRepository customerRepository,
                   DocumentRepository documentRepository) {
        this.url = url;
        this.customerRepository = customerRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public void serializeWithType(Task task, JsonGenerator gen, SerializerProvider provider, TypeSerializer typeSer)
            throws IOException {
        serialize(task, gen, provider);
    }

    @Override
    public void serialize(Task task, JsonGenerator gen, SerializerProvider provider) throws IOException {
        gen.writeStartObject();
        gen.writeStringField("link",
                UriComponentsBuilder
                        .fromHttpUrl(url)
                        .path("/api/v1/tasks/{taskId}")
                        .buildAndExpand(task.getId())
                        .toUriString());
        gen.writeNumberField("dueAt", task.getDueAt().getTime());
        gen.writeNumberField("initializedAt", Optional.ofNullable(task.getInitializedAt()).map(Timestamp::getTime).orElse((long) -1));
        gen.writeNumberField("abortedAt", Optional.ofNullable(task.getAbortedAt()).map(Timestamp::getTime).orElse((long) -1));
        gen.writeNumberField("failedAt", Optional.ofNullable(task.getFailedAt()).map(Timestamp::getTime).orElse((long) -1));
        gen.writeNumberField("completedAt", Optional.ofNullable(task.getCompletedAt()).map(Timestamp::getTime).orElse((long) -1));
        gen.writeBooleanField("enabled", task.isEnabled());
        gen.writeStringField("type", task.getType().name());
        gen.writeStringField("action", task.getAction().name());

        if (Objects.nonNull(task.getCustomerId())) {
            Customer customer = customerRepository.findById(task.getCustomerId());

            gen.writeObjectFieldStart("customer");
            gen.writeNumberField("id", customer.getId());
            gen.writeStringField("firstName", customer.getFirstName());
            gen.writeStringField("lastName", customer.getLastName());
            gen.writeStringField("email", customer.getEmail());
            gen.writeStringField("company", customer.getCompany());
            gen.writeEndObject();
        }

        switch (task.getType()) {
            case DOCUMENT:
                if (Objects.nonNull(((DocumentTask) task).getDocumentId())) {
                    Document document = documentRepository.findById(((DocumentTask) task).getDocumentId());

                    gen.writeObjectFieldStart("document");
                    gen.writeNumberField("id", document.getId());
                    gen.writeStringField("name", document.getName());
                    gen.writeStringField("friendlyId", document.getFriendlyId());
                    gen.writeEndObject();

                    gen.writeObjectFieldStart("data");
                    gen.writeStringField("taskMessage", ((DocumentTask) task).getData().getTaskMessage());
                    gen.writeNumberField("pageNumber", ((DocumentTask) task).getData().getPageNumber());
                    gen.writeEndObject();
                }
                break;
        }

        gen.writeEndObject();
    }
}