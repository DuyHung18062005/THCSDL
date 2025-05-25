package Main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "main.repository")
public class ThcsdlApplication {

	public static void main(String[] args) {
		SpringApplication.run(ThcsdlApplication.class, args);
	}

}
