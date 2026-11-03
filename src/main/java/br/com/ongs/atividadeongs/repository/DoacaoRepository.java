package br.com.ongs.atividadeongs.repository;

import br.com.ongs.atividadeongs.models.Doacao;
import br.com.ongs.atividadeongs.models.StatusDoacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoacaoRepository extends JpaRepository<Doacao, Long> {

    List<Doacao> findByAnimalIdOrderByDataDesc(Long animalId);

    List<Doacao> findByPadrinhoIdOrderByDataDesc(Long padrinhoId);

    List<Doacao> findByStatus(StatusDoacao status);
}
