package com.slidepiper.repository;

import com.slidepiper.model.entity.viewer.ViewerEvent;
import org.springframework.data.repository.Repository;

public interface ViewerEventRepository extends Repository<ViewerEvent, Long> {
  ViewerEvent save(ViewerEvent entity);
}