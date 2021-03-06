package slidepiper.db;

import com.slidepiper.model.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository("dbLayerRepository")
public interface DBLayerRepository extends JpaRepository<Customer,Long> {

    @Query("select c from Customer c where c.email=:email")
    Customer getCustomerByEmail(@Param("email") String email);


    @Query("select c from Customer c where c.email=:email and c.username=:sales_man")
    Customer getCustomerByEmailAndSalesMan(@Param("email") String email,@Param("sales_man") String sales_man);


}
