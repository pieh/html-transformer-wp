Barebone Gatsby starter used to verify pull requests against `gatsby-source-wordpress`

Used with Wordpress instance running in docker:

`docker-compose.yml`

```
version: "2"

services:
  db:
    image: mysql:5.6
    ports:
      - "3306:3306"
    volumes:
      - "./.data/db:/var/lib/mysql"
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: wordpress
      MYSQL_DATABASE: wordpress
      MYSQL_USER: wordpress
      MYSQL_PASSWORD: wordpress

  wordpress:
    image: wordpress:latest
    depends_on:
      - db
    links:
      - db
    ports:
      - "7000:80"
    restart: always
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_PASSWORD: wordpress
    volumes:
      - ./wp-content:/var/www/html/wp-content
      - ./wp-app:/var/www/html

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      - PMA_ARBITRARY=1
      - PMA_HOST=sessions_db
      - PMA_USER=wordpress
      - PMA_PASSWORD=wordpress
    restart: always
    ports:
      - 8080:80
    volumes:
      - /sessions
```

Create empty directory, save above config file to `docker-compose.yml` and run `docker-compose up`. This will create instance of wordpress site on first run (you will need to setup admin account). It will persist changes etc. You will have access to `wp-content` or entire `wp-app` files.
