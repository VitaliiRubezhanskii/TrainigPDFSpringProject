package com.slidepiper.repository;

import com.slidepiper.model.entity.IpWhiteList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface IpWhitelistRepository extends JpaRepository<IpWhiteList,Integer> {


    @Query(value = "SELECT EXISTS(                                                    \n"
            + "SELECT                                                                 \n"
            + "	whitelist_ip                                                          \n"
            + "FROM ip_whitelist                                                      \n"
            + "INNER JOIN slides ON ip_whitelist.FK_file_id_ai = slides.id_ai "
            + "AND slides.status IN ('CREATED', 'UPDATED', 'BEFORE_AWS_S3_TRANSITION')\n"
            + "INNER JOIN msg_info ON msg_info.slides_id = slides.id                  \n"
            + "WHERE whitelist_ip = :ip                                               \n"
            + "AND msg_info.id = :fileLinkHash                                                    \n"
            + ")",nativeQuery = true)
    boolean isIPMatchClientIP(@Param("fileLinkHash") String fileLinkHash, @Param("ip") String ip);
}
