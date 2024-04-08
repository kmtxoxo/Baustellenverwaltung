# Baustellenverwaltung-Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.2.
Das Projekt stellt eine Verwaltungssoftware für Baustellen da, in der Zeiten, Material,
Informationen zu Baustellen und vieles weiteres festgehalten werden können

## Installation

### Frontend
Zum Starten des Projekts müssen zu Beginn alle Abhängigkeiten installiert werden.
Hierzu muss das Kommando `npm install` ausgeführt werden.
Danach muss das Backend gestartet werden. Die Installationsanleitung hierfür liegt im Backend-Ordner.
Anschließend kann man mit dem Kommando `ng-serve` das Frontend starten und zur Startseite   `http://localhost:4200/` navigieren.

Wenn man die Anwendung auf einem mobilen Endgerät testen möchte, muss die UI über den Befehl `ng serve --host 0.0.0.0` gestartet werden.
Des Weiteren muss sich der Dev-Server (UI) im selben Netzwerk wie das mobile Endgerät befinden und in der `environment.ts` Datei muss die
IP-Addresse der API auf den Client eingestellt werden, auf dem die API läuft.


Logindaten der UI  
    username : admin
    password : public


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

