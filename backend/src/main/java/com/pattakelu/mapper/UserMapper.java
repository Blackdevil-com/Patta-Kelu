package com.pattakelu.mapper;

import com.pattakelu.dto.response.AuthResponse;
import com.pattakelu.dto.response.UserProfileResponse;
import com.pattakelu.entity.Role;
import com.pattakelu.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToStrings")
    UserProfileResponse toProfileResponse(User user);

    @Mapping(target = "roles", source = "roles", qualifiedByName = "rolesToStrings")
    AuthResponse.UserInfo toUserInfo(User user);

    @Named("rolesToStrings")
    default List<String> rolesToStrings(Set<Role> roles) {
        if (roles == null) return List.of();
        return roles.stream().map(Role::getName).collect(Collectors.toList());
    }
}
