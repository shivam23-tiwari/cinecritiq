#!/bin/bash
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/if (!String(error).includes('\''Quota limit exceeded'\'') \&\& !(error?.message || "").includes('\''Quota limit exceeded'\'')) {/if (!String(error).includes('\''Quota limit exceeded'\'') \&\& !(error?.message || "").includes('\''Quota limit exceeded'\'')) {/g'
