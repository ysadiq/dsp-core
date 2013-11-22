#!/bin/bash
#
# @(#)$Id: scriptHelpers.sh,v 1.01 2011-11-12 jablan $
#
# Some helper junk
#

################################################################################
# General
################################################################################

if [ ${_df_scriptHelpers:-0} -eq 1 ] ; then
	return
fi

_debug=${DF_DEBUG:=0} 					# 	set to 1 to dump paths when running
_df_scriptHelpers=1						#	Tells other scripts that this has been run already
_ME=`basename "${0}"`					# 	The name of the running script
B1=`tput bold`							#	Everyone likes bold text!
B2=`tput sgr0`							#	Ok, so not everyone...
SYSTEM_TYPE=`uname -s`					#	The type of system (i.e. Linux, Mac, Windows)
FABRIC_MARKER=/var/www/.fabric_hosted	#	Our Fabric marker
BASE_PATH=`pwd`							# 	The current path

# Source gitenv.sh if available
[ -d "./.git" ] && [ "`which gitenv.sh >/dev/null 2>&1 ; echo $?`" != "0" ] && . gitenv.sh

################################################################################
# Colors
################################################################################

# Reset & Escape
C_ESC='\E['
C_CLR='\E[0m'
alias _treset="tput sgr0"

# Foreground Codes
CF_BLK="30"
CF_RED="31"
CF_GRN="32"
CF_YLW="33"
CF_BLU="34"
CF_MAG="35"
CF_CYN="36"
CF_WHT="37"

# Background Codes
CB_BLK="40"
CB_RED="41"
CB_GRN="42"
CB_YLW="43"
CB_BLU="44"
CB_MAG="45"
CB_CYN="46"
CB_WHT="47"

_BLACK='30m'
_RED='31m'
_GREEN='32m'
_YELLOW='33m'
_BLUE='34m'
_MAGENTA='35m'
_CYAN='36m'
_WHITE='37m'

# Initialize terminal database
tput init

# Color Echo
# $1 = string to echo
# $2 = color
# $3 = bold (1=on,0=off)
# $4 = lf (1=newline)
function cecho()
{
	local _defaultMessage=""

	_message=${1:-${_defaultMessage}}
	_color=${2:-${_WHITE}}
	_bold=${3:-0}
	_lf=${4:-0}
	_b1=
	_b2=

    if [ ${_bold} -eq 1 ] ; then
    	_b1=${B1}
    	_b2=${B2}
    fi

    if [ ${_lf} -ne 0 ] ; then
        _echo="-e"
    else
    	_echo="-ne"
    fi

    echo ${_echo} "${_b1}\033[${_color}${_message}\033[0m${_b2}"

	return
}

# Display a message
# $1 = tag
# $2 = tag color
# $3 = message text
# $4 = message color
# $5 = message bold
_msg() {
	local _pre=$(echo -e "${1}:\t")
	cecho "${_pre}" "${2:-$_WHITE}" 1 0
	cecho "$3" "${2:-$_WHITE}" ${5:-0} 1
}

_info() {
	_msg "${_ME}" "${_GREEN}" "$1"
}

_notice() {
	_msg "${_ME} notice" "${_YELLOW}" "$1"
}

_error() {
	_msg "${_ME} error" "${_RED}" "$1"
}

_dbg() {
	[ ${_debug} -eq 1 ] && cecho "$1" "${2:-$_YELLOW}" "${3:-0}" "${4:-1}"
}

# Output a header thing
# $1 = text
function sectionHeader()
{
	cecho "********************************************************************************" ${_GREEN} 0 1
	cecho "*" ${_GREEN} 0 0 ; cecho "${1}" ${_WHITE} 1 1
	cecho "********************************************************************************" ${_GREEN} 0 1
	echo ""
}
