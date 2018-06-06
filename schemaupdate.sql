/* 05.04.2018; On devel */
ALTER TABLE `slides` ADD COLUMN `is_process_mode` TINYINT(1) NOT NULL DEFAULT 0;

/* 11.04.2018; On devel */
ALTER TABLE `slides` ADD COLUMN `is_mfa_enabled` TINYINT(1) NOT NULL DEFAULT 0;

/* 13.04.2018; On devel */
ALTER TABLE `customers` ADD COLUMN `customer_id` VARCHAR(256) DEFAULT NULL;
ALTER TABLE `customers` ADD COLUMN `phone` VARCHAR(256) DEFAULT NULL;

/* 30.04.2018; On devel */
CREATE TABLE customer_documents
(
  id       BIGINT AUTO_INCREMENT
    PRIMARY KEY,
  customer_id INT                                                                                              NOT NULL,
  salesman_id INT                                                                                              NOT NULL,
  channel_id BIGINT                                                                                               NOT NULL,
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP                                                              NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP                                                              NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP                                                              NULL ON UPDATE CURRENT_TIMESTAMP,
  status      ENUM ('BEFORE_AWS_S3_TRANSITION', 'CREATED', 'DELETED', 'DISABLED', 'UPDATED') DEFAULT 'CREATED' NOT NULL,
  version_id  VARCHAR(1024)                                                                                    NULL,
  friendly_id          VARCHAR(50)                                                                                      NULL,
  name        VARCHAR(255)                                                                                     NOT NULL,
  CONSTRAINT friendly_id UNIQUE (friendly_id),
  CONSTRAINT customer_documents_ibfk_1
  FOREIGN KEY (customer_id) REFERENCES customers (id),
  CONSTRAINT customer_documents_ibfk_2
  FOREIGN KEY (salesman_id) REFERENCES sales_men (id),
  CONSTRAINT customer_documents_ibfk_3
  FOREIGN KEY (channel_id) REFERENCES msg_info (id_ai)
);

/* 06.06.2018; */
CREATE TABLE upload_document_widget
(
  id       BIGINT AUTO_INCREMENT
    PRIMARY KEY,
  salesman_id INT                                                                                              NOT NULL,
  document_id BIGINT                                                                                           NOT NULL,
  customer_document_id BIGINT                                                                                  NOT NULL,
  icon VARCHAR(255)                                                                                            NOT NULL,
  page_from VARCHAR(255)                                                                                       NOT NULL,
  page_to VARCHAR(255)                                                                                         NOT NULL,
  status TINYINT DEFAULT 0                                                                                     NOT NULL,
  button_text_1 VARCHAR(255)                                                                                   NOT NULL,
  button_text_2 VARCHAR(255)                                                                                   NOT NULL,
  enabled TINYINT DEFAULT 0                                                                                    NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP                                                              NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP                                                              NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT upload_document_widget_ibfk_1
  FOREIGN KEY (salesman_id) REFERENCES sales_men (id),
  CONSTRAINT upload_document_widget_ibfk_2
  FOREIGN KEY (document_id) REFERENCES slides (id_ai),
  CONSTRAINT upload_document_widget_ibfk_3
  FOREIGN KEY (customer_document_id) REFERENCES customer_documents (id)
);