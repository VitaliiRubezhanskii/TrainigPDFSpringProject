/* 05.04.2018 */
ALTER TABLE `slides` ADD COLUMN `is_process_mode` TINYINT(1) NOT NULL DEFAULT 0;

/* 11.04.2018 */
ALTER TABLE `slides` ADD COLUMN `is_mfa_enabled` TINYINT(1) NOT NULL DEFAULT 0;

/* 13.04.2018 */
ALTER TABLE `customers` ADD COLUMN `customer_id` VARCHAR(256) DEFAULT NULL;
ALTER TABLE `customers` ADD COLUMN `phone` VARCHAR(256) DEFAULT NULL;

/* 30.04.2018 */
CREATE TABLE customer_documents
(
  id       BIGINT AUTO_INCREMENT
    PRIMARY KEY,
  customer_id INT                                                                                              NOT NULL,
  salesman_id INT                                                                                              NOT NULL,
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
  FOREIGN KEY (salesman_id) REFERENCES sales_men (id)
);

