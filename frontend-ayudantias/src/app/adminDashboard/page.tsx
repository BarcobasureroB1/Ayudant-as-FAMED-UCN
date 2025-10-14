"use client";

import React, { SyntheticEvent, useState } from 'react';
import { useUserProfile,User } from '@/hooks/useUserProfile';
interface UserProps {
    user:User
}

export const AdminDashboard = ({user}:UserProps) => {

    return(
        <div>Bienvenido Admin: {user.nombres}</div>
    );

};

