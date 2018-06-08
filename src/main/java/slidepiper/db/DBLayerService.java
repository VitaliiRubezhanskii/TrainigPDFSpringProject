package slidepiper.db;

import com.slidepiper.model.entity.Customer;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface DBLayerService {

    void deleteCustomer(Customer customer);
    void addNewCustomer(Customer customer);
    String getCustomerName(Customer customer);
    boolean isCustomerExist(Customer customer);
    boolean isCustomerIDExist(Customer customer);
    boolean isCustomerIDTakenByAnotherUser(Customer customer);


    Customer getCustomerByEmail(String email,String username);


}
