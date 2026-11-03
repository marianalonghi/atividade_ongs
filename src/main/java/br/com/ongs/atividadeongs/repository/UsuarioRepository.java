package br.com.ongs.atividadeongs.repository;

import br.com.ongs.atividadeongs.models.PerfilUsuario;
import br.com.ongs.atividadeongs.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    List<Usuario> findByPerfil(PerfilUsuario perfil);
}
