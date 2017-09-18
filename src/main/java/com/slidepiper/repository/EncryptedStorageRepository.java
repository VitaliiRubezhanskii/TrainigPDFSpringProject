package com.slidepiper.repository;

import com.slidepiper.model.entity.EncryptedStorage;
import org.springframework.data.repository.Repository;

public interface EncryptedStorageRepository extends Repository<EncryptedStorage, Long> {
    EncryptedStorage findByType(String type);
}