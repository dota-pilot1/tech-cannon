package com.mapo.palantier.personal.bookmark;

import java.util.List;
import java.util.Optional;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PersonalBookmarkMapper {

    List<PersonalBookmark> findByUserId(@Param("userId") Long userId);

    Optional<PersonalBookmark> findById(@Param("id") Long id);

    void insert(PersonalBookmark bookmark);

    void update(PersonalBookmark bookmark);

    void softDelete(@Param("id") Long id);
}
