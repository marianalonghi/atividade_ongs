package br.com.ongs.atividadeongs.repository;

import br.com.ongs.atividadeongs.models.Animal;
import br.com.ongs.atividadeongs.models.StatusAnimal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnimalRepository extends JpaRepository<Animal, Long> {

    List<Animal> findByStatusOrderByNomeAsc(StatusAnimal status);

    List<Animal> findByNomeContainingIgnoreCase(String nome);
}
