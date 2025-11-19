#!/bin/bash

echo "Instalando Firebase CLI..."
npm install -g firebase-tools

echo "Desplegando reglas de Firestore..."
firebase deploy --only firestore:rules

echo "¡Reglas desplegadas exitosamente!"
