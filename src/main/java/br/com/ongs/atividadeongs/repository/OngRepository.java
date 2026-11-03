package br.com.ongs.atividadeongs.repository;

import br.com.ongs.atividadeongs.models.Ong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OngRepository extends JpaRepository<Ong, Long> {

    Optional<Ong> findFirstByOrderByIdAsc();
}
