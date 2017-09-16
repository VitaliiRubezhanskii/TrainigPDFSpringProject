package com.slidepiper.repository;

import com.slidepiper.model.entity.Storage;
import org.springframework.data.repository.Repository;

public interface StorageRepository extends Repository<Storage, Long> {
    Storage findByType(String type);

    Storage save(Storage storage);
}