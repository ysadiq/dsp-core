#!/bin/bash
# DreamFactory Application Packager Script
# Copyright (C) 2009-2013 DreamFactory Software, Inc. All Rights Reserved
#
# CHANGELOG:
#
# v1.0.0
#   General cleanup
#	Use scriptHelpers.sh common console library
#	Add /log and /vendor to exclude directories
#

# Get some help
. scriptHelpers.sh

# Methods
usage() {
	echo
	_msg "usage" ${_YELLOW} "${_ME} [application API name]"

	echo
	echo "  ${B1}[application API name]${B2} is the endpoint or API name of your application."
	echo "  This ${B1}must match${B2} the name of the directory containing the application."
	echo


	echo "You may turn on DEBUG output by setting ${B1}DF_DEBUG${B2}=1 either in your ~/.bashrc or on the command line:"
	echo
	echo "  $ DF_DEBUG=1 ${_ME}"
	echo

	exit 1
}

ZIP_CMD=`which zip`
ZIP_EXCLUDES=""
VERSION=1.0.0
SYSTEM_TYPE=`uname -s`
FABRIC_MARKER=/var/www/.fabric_hosted
TAG="Mode: ${B1}Local${B2}"
APP_API_NAME="$1"
BASE_PATH=`pwd`
ZIP_OUTPUT_FILE="${BASE_PATH}/${APP_API_NAME}.zip"
DFPKG_OUTPUT_FILE="${BASE_PATH}/${APP_API_NAME}.dfpkg"
FILE_LIST=("description.json" "schema.json" "data.json" "services.json")
CONTENTS=
ZIP_SOURCE_PATH="${APP_API_NAME}"

if [ -z "${APP_API_NAME}" ] ; then
   _error "No application API name specified."
   usage
fi

if [ -f "${FABRIC_MARKER}" ] ; then
	FABRIC=1
	TAG="Mode: ${B1}Fabric${B2}"
fi

echo "${B1}DreamFactory Services Platform(tm)${B2} ${SYSTEM_TYPE} Application Packager [${TAG} v${VERSION}]"
_dbg "  * Debug Mode Enabled" ${_YELLOW} 1 1

[ -f "${ZIP_OUTPUT_FILE}" ]   && cecho "  * Removing existing ZIP file: ${ZIP_OUTPUT_FILE}" ${_RED} 0 1 && rm ${ZIP_OUTPUT_FILE}
[ -f "${DFPKG_OUTPUT_FILE}" ] && cecho "  * Removing existing DFPKG file: ${DFPKG_OUTPUT_FILE}" ${_RED} 0 1 && rm ${DFPKG_OUTPUT_FILE}

if [ ! -d "./${ZIP_SOURCE_PATH}" ] ; then
	_error "Source path/app \"${ZIP_SOURCE_PATH}\" not found."
	_error "Be sure to be one directory level above your intended package directory."
	usage
fi

for _file in ${FILE_LIST[*]}
do
	_dbg "  * Checking file: ${ZIP_SOURCE_PATH}/${_file}" ${_WHITE} 0 1
	[ -f "${ZIP_SOURCE_PATH}/${_file}" ] &&
		CONTENTS="${CONTENTS}${ZIP_SOURCE_PATH}/${_file} " &&
		_dbg "    File \"${ZIP_SOURCE_PATH}/${_file}\" added to package payload" "${_CYAN}" 0 1
done

_dbg "  * Source directory: ${ZIP_SOURCE_PATH}"

#_dbg "  * Running command: ${ZIP_CMD} -r ${ZIP_OUTPUT_FILE} ${APP_API_NAME} ${CONTENTS} -x */\.*" {$_YELLOW} 1 1

cecho "  * Creating package" ${_GREEN} 1 0
"${ZIP_CMD}" -r "${ZIP_OUTPUT_FILE}" "${ZIP_SOURCE_PATH}" ${CONTENTS} -x "*/\.idea/*" -x "*/\.git/*" -x "*/log/*" -x "*/vendor/*" >>~/df.${_ME}.log 2>&1
[ $? -eq 0 ] && cecho " done! ${BASE_PATH}/${APP_API_NAME}.zip created" ${_GREEN} 0 1
[ $? -ne 0 ] && cecho " error! Did not create ${BASE_PATH}/${APP_API_NAME}.zip!" ${_RED} 1 1

_dbg "  * Housekeeping/cleanup..." ${_YELLOW} 0 1

echo "Complete. Enjoy the rest of your day!"

exit 0
