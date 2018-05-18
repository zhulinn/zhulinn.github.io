---
title: "UEFI+GPT启动Windows原理及手动修复引导"
date: 2018-01-29 11:08:44
tags: 装机
categories: 日常
---
# 引导原理
接通电源 → 启动bios → esp分区 → /EFI/boot/bootx64.efi →   
/EFI/Microsoft/BCD → 系统分区 → /Windows/system32/winload.exe
# 手动修复引导
<!-- more -->
1. 转换硬盘格式为GPT
2. 新建esp分区 或FAT16类型
3. esp分区下文件目录
``` bash
/efi/boot/bootx64.efi

/efi/Microsoft/boot/BCD
```

>其中bootx64.efi通过拷贝系统分区:/windows/boot/EFI/bootmgfw.efi 并重命名bootx64.efi  BCD 通过PE中bootice软件新建(将启动分区设置为系统分区)
