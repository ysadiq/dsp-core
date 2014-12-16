## Usage with apache v2.4+
These settings will work on Ubuntu 14.04+ and CentOS 5+.

On Ubuntu systems, do the following:

 1. copy the files from `config/external/apache/etc/apache2/sites-available` into your `/etc/apache2/sites-available/` directory.

Edit the newly files accordingly to match your system configuration (i.e. log location, server name, etc.).

### Enable the site
Using the apache a2ensite tool, enable the new available site and restart apache:

```
$ sudo a2ensite dsp.local ssl-dsp.local && sudo service apache2 restart
```

## Other OSes
CentOS and Redhat have similar virtual-host setups and you should be able to adapt the included files easily.

### Windows
You're on your own pal.
