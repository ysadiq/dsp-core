## Usage with Apache
On Ubuntu systems, copy the two files below into your `/etc/apache2/sites-available/` directory.

Once there you can enable them and enable as follows:

### Enable
```
$ sudo a2ensite dsp.local
$ sudo a2ensite ssl-dsp.local
```

### Disable
```
$ sudo a2dissite dsp.local
$ sudo a2dissite ssl-dsp.local
```

## Other OSes
CentOS and Redhat have similar virtual-host setups and you should be able to adapt the included files easily.

### Windows
You're on your own bud.
