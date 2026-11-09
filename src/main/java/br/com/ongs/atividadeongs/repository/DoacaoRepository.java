package br.com.ongs.atividadeongs.repository;

import br.com.ongs.atividadeongs.models.Doacao;
import br.com.ongs.atividadeongs.models.StatusDoacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DoacaoRepository extends JpaRepository<Doacao, Long> {

    List<Doacao> findByAnimalIdOrderByDataDesc(Long animalId);

    List<Doacao> findByPadrinhoIdOrderByDataDesc(Long padrinhoId);

    List<Doacao> findByStatus(StatusDoacao status);

    @Query("select coalesce(sum(d.valor), 0) from Doacao d " +
            "where d.animal.id = :animalId and d.status <> :status")
    BigDecimal somarValorPorAnimal(@Param("animalId") Long animalId,
                                   @Param("status") StatusDoacao status);
}