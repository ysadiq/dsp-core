## DreamFactory Recommended PHP Runtime Settings
These settings will work on Ubuntu 14.04+ and CentOS 5+.

On Ubuntu systems, do the following:

 1. copy the `dreamfactory.ini` file from `config/external/php/etc/php5/mods-available` into your `/etc/php5/mods-available/` directory.
 2. Enable the "mod" by issuing the command: `$ sudo php5enmod dreamfactory`. This will install the `dreamfactory.ini` file into the `mods-available` directory and create symbolic links to all installed PHP configurations.
 3. [OPTIONAL] If you're using PHP-FPM, restart the PHP-FPM service: `$ sudo service php5-fpm restart`
 3. Restart your web server: `$ sudo service apache2 restart` or `$ sudo service nginx restart` depending on your flavor.

## Other OSes
CentOS and Redhat have similar virtual-host setups and you should be able to adapt the included file easily.

### Windows
You're on your own bud.
