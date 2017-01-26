package com.slidepiper.model.repository.widget;

import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import com.slidepiper.model.entity.widget.Widget;

@NoRepositoryBean
public interface WidgetRepository<T extends Widget> extends Repository<T, Long> {
  T findByDocumentId(Long documentId);
}
